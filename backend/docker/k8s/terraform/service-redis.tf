resource "kubernetes_service" "twentycrm_redis" {
  metadata {
    name      = "${var.twentycrm_app_name}-redis"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.twentycrm_app_name}-redis"
    }
    session_affinity = "ClientIP"
    port {
      port        = 6379
      target_port = 6379
    }

    type = "ClusterIP"
  }
}
