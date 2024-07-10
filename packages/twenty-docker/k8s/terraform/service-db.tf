resource "kubernetes_service" "twentycrm_db" {
  metadata {
    name      = "${local.twentycrm_app_name}-db"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${local.twentycrm_app_name}-db"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}
