resource "kubernetes_service" "twentycrm_db" {
  metadata {
    name      = "${var.twentycrm_app_name}-db"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.twentycrm_app_name}-db"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}
